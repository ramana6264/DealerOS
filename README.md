# DealerOS reconciliation

This is a Django and SQLite reconciliation app. It imports both ledgers without dropping dirty rows, compares System B with System A's `total_value`, and exposes tenant-filtered disagreement data at `/api/disagreements/?org=ORG-A`.

The design choices are documented in [DECISIONS.md](DECISIONS.md).

## Run from a clean clone

```powershell
git clone <your-private-repository-url> dealeros
cd dealeros
python --version
py -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py import_data
python manage.py import_data
python -m pytest -q
python manage.py runserver
```

In a second terminal, start the React frontend:

```powershell
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. The Django API remains available at `http://127.0.0.1:8000/api/`.

The `runserver` command starts the Django backend and serves the table UI. Running `import_data` twice is expected to produce the same 120 A and 121 B database rows.

Optional Django test commands:

```powershell
python manage.py test reconcile.tests.test_compare
python manage.py test reconcile.tests.test_tenant_isolation
```

## What it builds

The app imports the three CSV files, stores dirty values as null when parsing fails, normalizes B record references, compares A and B records, exposes tenant-filtered disagreements, and renders a filterable and sortable table.

## Deliberate scope

There is no authentication, pagination, Docker setup, or elaborate CSS. The `org` query parameter is the tenant boundary required by this assessment; production authentication would bind it to the logged-in tenant.

## Working with the agent

I used GitHub Copilot in VS Code for small implementation tasks: Django project setup, models, the CSV importer, pure comparison functions, API filtering, the HTML table, tests, documentation, and commit organization. I supplied the assessment and real CSV context, then reviewed the generated code and ran the importer, pytest, Django checks, and a clean-clone reproduction. The checks caught the need for normalized references, Decimal parsing, and database-side tenant filtering; the importer output also proves that all 120 A and 121 B rows are saved.

## Assessment questions

**a. One thing the AI agent got wrong.** The first approach could have compared B against A's `base_value`; I caught this by opening the CSVs and checking several rows where the B value matched `base_value + adjustment`, also known as `total_value`.

**b. Least confident part.** I am least confident about production authorization, because this assessment uses `?org=` as the tenant boundary and does not include login or server-side identity. I would verify that the authenticated principal, not a caller-controlled parameter, controls the selected org.

**c. If I had a second day.** I would add authentication and bind the org to the authenticated identity, because query-string tenant selection could otherwise let a caller request another organization's data.
