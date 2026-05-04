#!/usr/bin/env bash
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

# Run database migrations
python add_category_column.py
python add_override_columns.py
python migrate_categories.py
