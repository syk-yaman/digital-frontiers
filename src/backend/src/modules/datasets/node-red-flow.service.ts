import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Dataset, UpdateFrequencyUnit } from './dataset.entity';

@Injectable()
export class NodeRedFlowService {
    /**
        * Adds a new Node-RED flow for the given dataset.
        * @param dataset The dataset entity object.
        */
    async addNodeRedFlowForDataset(dataset: Dataset): Promise<void> {
        const NODE_RED_API_URL = process.env.NODE_RED_API_URL;
        // 1. Fetch current flows
        const flowsRes = await axios.get(`${NODE_RED_API_URL}/flows`);
        const flows = flowsRes.data;

        // 2. Generate unique IDs for new nodes
        const genId = () => Math.random().toString(16).substr(2, 16);
        const tabId = genId();
        const brokerId = genId();
        const mqttInId = genId();
        const delayId = genId();
        const functionId = genId();
        const httpReqId = genId();

        // 3. Frequency mapping for delay node
        let rate = 1, rateUnits = 'hour';
        if (dataset.updateFrequencyUnit === UpdateFrequencyUnit.SECONDS) {
            rate = 1;
            rateUnits = 'minute';
        } else if (dataset.updateFrequencyUnit === UpdateFrequencyUnit.HOURS && dataset.updateFrequency >= 1) {
            rate = Math.floor(dataset.updateFrequency);
            rateUnits = 'hour';
        } else if (dataset.updateFrequencyUnit === UpdateFrequencyUnit.DAYS && dataset.updateFrequency >= 1) {
            rate = Math.floor(dataset.updateFrequency);
            rateUnits = 'day';
        }// else: always minimum 1 msg/hour

        // 4. MQTT broker credentials
        let credentials = undefined;
        if (dataset.mqttUsername && dataset.mqttPassword) {
            credentials = {
                user: dataset.mqttUsername,
                password: dataset.mqttPassword
            };
        }

        // 5. Build new flow nodes
        const tab = {
            id: tabId,
            type: "tab",
            label: String(dataset.id),
            disabled: false,
            info: "",
            env: []
        };
        const mqttBroker = {
            id: brokerId,
            type: "mqtt-broker",
            name: `MQTTBroker${dataset.id}`,
            broker: dataset.mqttAddress,
            port: String(dataset.mqttPort),
            clientid: "",
            autoConnect: true,
            usetls: false,
            protocolVersion: "4",
            keepalive: "60",
            cleansession: true,
            autoUnsubscribe: true,
            birthTopic: "",
            birthQos: "0",
            birthPayload: "",
            birthMsg: {},
            closeTopic: "",
            closePayload: "",
            closeMsg: {},
            willTopic: "",
            willQos: "0",
            willPayload: "",
            willMsg: {},
            userProps: "",
            sessionExpiry: "",
            ...(credentials ? { credentials } : {})
        };
        const mqttIn = {
            id: mqttInId,
            type: "mqtt in",
            z: tabId,
            name: "Subscribe to dataset topic",
            topic: dataset.mqttTopic || "",
            qos: "0",
            datatype: "auto-detect",
            broker: brokerId,
            nl: false,
            rap: true,
            rh: 0,
            inputs: 0,
            x: 130,
            y: 120,
            wires: [[delayId]]
        };
        const delay = {
            id: delayId,
            type: "delay",
            z: tabId,
            name: "Rate Limit",
            pauseType: "rate",
            timeout: "5",
            timeoutUnits: "seconds",
            rate: String(rate),
            nbRateUnits: "1",
            rateUnits: rateUnits,
            randomFirst: "1",
            randomLast: "5",
            randomUnits: "seconds",
            drop: true,
            allowrate: false,
            outputs: 1,
            x: 380,
            y: 120,
            wires: [[functionId]]
        };
        const functionNode = {
            id: functionId,
            type: "function",
            z: tabId,
            name: "Format payload",
            func: `msg.headers = { "Content-Type": "application/json" };\n\n// Assuming payload is JSON or string\nlet body = typeof msg.payload === 'object' ? msg.payload : { message: msg.payload };\nmsg.payload = JSON.stringify(body);\nreturn msg;`,
            outputs: 1,
            timeout: "",
            noerr: 0,
            initialize: "",
            finalize: "",
            libs: [],
            x: 600,
            y: 120,
            wires: [[httpReqId]]
        };
        const httpRequest = {
            id: httpReqId,
            type: "http request",
            z: tabId,
            name: "POST to API",
            method: "POST",
            ret: "txt",
            paytoqs: "ignore",
            //This URL uses Docker's virtual network, adjust if using outside Docker,
            //Otherwise realtime status updates will not work
            url: `http://backend:3000/datasets/test/${dataset.id}`,
            tls: "",
            persist: false,
            proxy: "",
            insecureHTTPParser: false,
            authType: "",
            senderr: false,
            headers: [],
            x: 790,
            y: 120,
            wires: [[]]
        };

        // 6. Add new nodes to flows
        flows.push(tab, mqttBroker, mqttIn, delay, functionNode, httpRequest);

        // 7. POST updated flows
        await axios.post(`${NODE_RED_API_URL}/flows`, flows);
    }

    /**
     * Removes the Node-RED flow (tab and all related nodes) for the given dataset id.
     * @param datasetId The dataset id whose flow should be removed.
     */
    async removeNodeRedFlowForDataset(datasetId: number): Promise<void> {
        const NODE_RED_API_URL = process.env.NODE_RED_API_URL;
        // 1. Fetch current flows
        const flowsRes = await axios.get(`${NODE_RED_API_URL}/flows`);
        let flows = flowsRes.data;

        // 2. Find the tab node for this dataset id (label === datasetId as string)
        const tabNode = flows.find((node: any) => node.type === "tab" && node.label === String(datasetId));
        if (!tabNode) {
            // Nothing to remove
            return;
        }
        const tabId = tabNode.id;

        // 3. Collect all node ids to remove (tab + all nodes with z === tabId, and any mqtt-broker/http nodes only used by this tab)
        const nodesToRemove = new Set<string>();
        nodesToRemove.add(tabId);

        // Find all nodes belonging to this tab
        flows.forEach((node: any) => {
            if (node.z === tabId) {
                nodesToRemove.add(node.id);
                // If node has a broker property, mark the broker for removal if not used elsewhere
                if (node.type === "mqtt in" && node.broker) {
                    const brokerId = node.broker;
                    // Check if any other mqtt in uses this broker
                    const usedElsewhere = flows.some((n: any) => n.type === "mqtt in" && n.broker === brokerId && n.z !== tabId);
                    if (!usedElsewhere) nodesToRemove.add(brokerId);
                }
                // If node is http request, mark for removal if not used elsewhere
                if (node.type === "http request") {
                    // http request nodes are usually only used in one flow, so safe to remove
                    nodesToRemove.add(node.id);
                }
            }
        });

        // 4. Remove all nodes in nodesToRemove
        flows = flows.filter((node: any) => !nodesToRemove.has(node.id));

        // 5. POST updated flows
        await axios.post(`${NODE_RED_API_URL}/flows`, flows);
    }
}
