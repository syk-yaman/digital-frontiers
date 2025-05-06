**Authorisation system table (Permissions vs. Roles):**

`Note: 
'Content' means: Datasets, Tags, and Showcases.`

| Permission/Role             | Public visitor | User | Controlled dataset granted user | Content owner | Admin |
| :-------------------------- | :------------- | :--- | :------------------------------ | :------------ | :---- |
| View public content         | Y              | Y    | Y                               | Y             | Y     |
| Create unapproved content   |                | Y    | Y                               | Y             | Y     |
| Edit own content            |                | Y    | Y                               | Y             | Y     |
| Create controlled datasets  |                | Y    | Y                               | Y             | Y     |
| View controlled datasets    |                |      | Y                               | Y             | Y     |
| Edit controlled datasets    |                |      |                                 | Y             | Y     |
| View own unapproved content |                |      |                                 | Y             | Y     |
| View all unapproved content |                |      |                                 |               | Y     |
| Create approved content     |                |      |                                 |               | Y     |
| Approve content             |                |      |                                 |               | Y     |
| Edit all content            |                |      |                                 |               | Y     |
| Edit homepage settings      |                |      |                                 |               | Y     |
| Manage users                |                |      |                                 |               | Y     |


