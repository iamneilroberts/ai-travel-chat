#!/bin/bash

curl -X POST 'https://api.sandbox.viator.com/partner/search/freetext' \
-H 'exp-api-key: e87bfe1f-975f-431a-b2fe-c3b49d0dcdf1' \
-H 'Content-Type: application/json' \
-H 'Accept: application/json;version=2.0' \
-H 'Accept-Language: en-US' \
-d '{
  "searchTerm": "Galway Ireland",
  "currency": "EUR",
  "searchTypes": [
    {
      "searchType": "PRODUCTS",
      "start": 1,
      "count": 50
    }
  ],
  "productFiltering": {},
  "productSorting": {
    "sortBy": "RATING",
    "sortOrder": "ASC"
  }
}'