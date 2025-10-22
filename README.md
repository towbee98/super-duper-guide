# String Analyzer Service

This is a RESTful API service that analyzes strings and stores their computed properties.

## Setup Instructions

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd string-analyzer-service
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

## How to Run Locally

To run the service locally in development mode (with hot-reloading):

```bash
npm run dev
```

The service will be available at `http://localhost:3000`.

To build and run the production version:

```bash
npm run build
npm start
```

## Dependencies

-   **express**: Web framework for Node.js

## Environment Variables

-   **PORT**: The port on which the server will run. Defaults to `3000`.

## API Endpoints

### 1. Create/Analyze String

-   **URL**: `/strings`
-   **Method**: `POST`
-   **Request Body**:
    ```json
    {
      "value": "string to analyze"
    }
    ```
-   **Success Response (201 Created)**:
    ```json
    {
      "id": "sha256_hash_value",
      "value": "string to analyze",
      "properties": {
        "length": 16,
        "is_palindrome": false,
        "unique_characters": 12,
        "word_count": 3,
        "sha256_hash": "abc123...",
        "character_frequency_map": { "s": 2, "t": 3, "r": 2, "i": 1, "n": 2, "g": 1, " ": 2, "a": 1, "l": 1, "y": 1, "z": 1, "e": 1 }
      },
      "created_at": "2025-08-27T10:00:00Z"
    }
    ```

### 2. Get Specific String

-   **URL**: `/strings/{string_value}`
-   **Method**: `GET`
-   **Success Response (200 OK)**: Returns the analyzed string object.

### 3. Get All Strings with Filtering

-   **URL**: `/strings`
-   **Method**: `GET`
-   **Query Parameters**:
    -   `is_palindrome` (boolean)
    -   `min_length` (integer)
    -   `max_length` (integer)
    -   `word_count` (integer)
    -   `contains_character` (string)
-   **Success Response (200 OK)**:
    ```json
    {
      "data": [ /* array of string objects */ ],
      "count": 15,
      "filters_applied": { /* ... */ }
    }
    ```

### 4. Natural Language Filtering

-   **URL**: `/strings/filter-by-natural-language`
-   **Method**: `GET`
-   **Query Parameters**:
    -   `query` (string): A natural language query (e.g., "all single word palindromic strings").
-   **Success Response (200 OK)**:
    ```json
    {
      "data": [ /* array of matching strings */ ],
      "count": 3,
      "interpreted_query": {
        "original": "all single word palindromic strings",
        "parsed_filters": { "word_count": 1, "is_palindrome": true }
      }
    }
    ```

### 5. Delete String

-   **URL**: `/strings/{string_value}`
-   **Method**: `DELETE`
-   **Success Response (204 No Content)**

## Running Tests

> **Note:** The test script is currently a placeholder and does not run any tests.

To run the tests, use the following command:

```bash
npm test
```
