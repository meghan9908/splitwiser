# Database Schema for Splitwiser 

1. Users 
| Column        | Type      | Description            |
| ------------- | --------- | ---------------------- |
| id (PK)       | UUID      | Unique user identifier |
| name          | TEXT      | User's full name       |
| email         | TEXT      | Unique email           |
| password_hash | TEXT      | Hashed password        |
| image_url     | TEXT      | Profile picture URL    |
| currency      | TEXT      | Preferred currency     |
| created_at    | TIMESTAMP |                        |
| updated_at    | TIMESTAMP |                        |


2. Groups
| Column     | Type      | Description         |
| ---------- | --------- | ------------------- |
| id (PK)    | UUID      | Group ID            |
| name       | TEXT      | Group name          |
| currency   | TEXT      | Group currency      |
| image_url  | TEXT      | Group picture       |
| created_by | UUID (FK) | Linked to Users(id) |
| created_at | TIMESTAMP |                     |
| updated_at | TIMESTAMP |                     |

3. GroupMembers
| Column        | Type      | Description            |
| ------------- | --------- | ---------------------- |
| group_id (FK) | UUID      | Linked to Groups(id)   |
| user_id (FK)  | UUID      | Linked to Users(id)    |
| role          | TEXT      | Optional: admin/member |
| joined_at     | TIMESTAMP |                        |
| created_at    | TIMESTAMP |                        |
| updated_at    | TIMESTAMP |                        |

4. Expenses
| id (PK)       | UUID      | Expense ID             |
| ------------- | --------- | ---------------------- |
| group_id (FK) | UUID      | Linked to Groups(id)   |
| created_by    | UUID      | Linked to Users(id)    |
| description   | TEXT      | Expense description    |
| amount        | NUMERIC   | Total amount           |
| metadata      | JSONB     | Splits, tags, receipts |
| created_at    | TIMESTAMP |                        |
| updated_at    | TIMESTAMP |                        |

5. Settlements
| Column          | Type      | Description            |
| --------------- | --------- | ---------------------- |
| id (PK)         | UUID      | Settlement ID          |
| expense_id (FK) | UUID      | Linked to Expenses(id) |
| payer_id (FK)   | UUID      | Who paid               |
| payee_id (FK)   | UUID      | Who received           |
| amount          | NUMERIC   | Settlement amount      |
| created_at      | TIMESTAMP |                        |
| updated_at      | TIMESTAMP |                        |

6. ExpenseComments (optional)
| Column         | Type | Description            |
| -------------- | ---- | ---------------------- |
| id (PK)        | UUID | Comment ID             |
| expense_id(FK) | UUID | Linked to Expenses(id) |
| user_id (FK)   | UUID | Author                 |
| content        | TEXT | Comment text           |
| created_at     | TIMESTAMP |                    |
| updated_at     | TIMESTAMP |                    |

7. ExpenseHistory (optional)
| Column         | Type      | Description               |
| -------------- | --------- | ------------------------- |
| id (PK)        | UUID      | Record ID                 |
| expense_id(FK) | UUID      | Linked to Expenses(id)    |
| user_id (FK)   | UUID      | Who edited                |
| before_data    | JSONB     | Snapshot of previous data |
| edited_at      | TIMESTAMP |                           |