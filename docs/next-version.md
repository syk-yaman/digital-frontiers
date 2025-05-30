# Next Version: Garnet Integration & Wisdom Layer

This document outlines the planned improvements for the next version of the Digital Frontiers platform, focusing on data ingestion, processing, and advanced analytics.

**Make sure to check Trello board which contains a lot of planned features in the backlog.**
---

## Garnet Framework & Data Ingestion

We plan to migrate from the current [Node-RED](https://nodered.org/) setup to [Garnet Framework](https://garnet-framework.dev/) for scalable, robust data ingestion and processing.

### Current Approach

- **Node-RED** is used to manage data flows dynamically.
- Each dataset has a separate tab/flow.
- Works well for MQTT datasets with simple structures.
- For advanced use cases (complex data, batch ingestion, validation), Node-RED is limited.

### Planned Approach

- **Garnet Framework** will be used for dynamic, scalable ingestion.
- **AWS SQS** will serve as the ingestion queue, buffering incoming data.
- Data can be ingested via:
  - Directly through the context broker's NGSI-LD API.
  - Via SQS queue (which then feeds into NGSI-LD API with buffering/batch).
- See Garnet docs for [NGSI-LD format](https://garnet-framework.dev/docs/understanding-ngsi-ld).
- Dynamic pipeline: The system should detect and convert new data sources/formats on the fly. LLMs can help with conversion, but validation is required before data enters the system.

#### Notes from Garnet Team

> For getting data into Garnet, you've got two main options: either directly through the context broker's NGSI-LD API, or via the SQS ingestion queue (which ultimately feeds into the same NGSI-LD API endpoint, just with buffering and batch).
>
> You can find the content on NGSI-LD format in the "Understanding NGSI-LD" section.
>
> Feel free to send me an example of your raw data, and I can show you how it would look in NGSI-LD format. LLMs do a decent job with the formatting, though it's best to double-check their output.
>
> The dynamic ingestion pipeline is tricky - you'll need to detect the format of new data sources on the fly and build the conversion. LLMs can help here too, but you'll want some validation in place to make sure everything's properly formatted before it goes into the system.

---

## Wisdom Layer

- **AWS Q** is a candidate for the wisdom layer, providing access to the last N readings of a dataset.
- Data access can be via Node-RED or Garnet.
- Architecture must be designed to protect from unfair or abusive usage (rate limiting, access controls, etc).

---

## Cesium Integration

- Cesium integration is planned for advanced 3D visualisation.

---

## Migration Considerations

- Migration from Node-RED to Garnet should be gradual, starting with new/less-complex datasets.
- Existing simple MQTT flows can remain on Node-RED until fully migrated.
- Data validation and format detection are critical for robust ingestion.

---

For more details, see [Garnet Framework documentation](https://garnet-framework.dev/).
