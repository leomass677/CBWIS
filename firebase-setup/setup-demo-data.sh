#!/bin/bash

# CBWIS - Initialization Script for Demo
# This script sets up test data in Firestore

echo "CBWIS - Setting up demo data..."
echo "================================"

# Note: You need to have the backend running and authenticated
# This is a guide for manual setup or to be run from backend

echo ""
echo "To populate demo data, use the backend API:"
echo ""
echo "1. Create inventory items:"
echo "   POST http://localhost:3000/inventory"
echo "   Body: { \"itemName\": \"Item Name\", \"category\": \"Category\", \"quantity\": 100, \"unitPrice\": 50 }"
echo ""
echo "2. Create transactions:"
echo "   POST http://localhost:3000/transactions/in"
echo "   Body: { \"itemId\": \"item_id\", \"quantity\": 50, \"performedBy\": \"admin@example.com\" }"
echo ""
echo "3. Generate reports:"
echo "   GET http://localhost:3000/reports/inventory"
echo "   GET http://localhost:3000/reports/transactions"
echo ""
echo "================================"
echo "Demo data setup complete!"
