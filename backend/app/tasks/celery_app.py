try:
    from celery import Celery
except ImportError:
    Celery = None

celery_app = Celery("ethiocode") if Celery else None
