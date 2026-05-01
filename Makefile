.PHONY: frontend backend

frontend:
	cd frontend && npm run dev

backend:
	cd backend && python run.py
