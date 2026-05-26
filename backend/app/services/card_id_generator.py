import random
import string
from app.models import Family


def generate_privilege_card_id() -> str:
    while True:
        prefix = "TNFP"
        suffix = "".join(random.choices(string.digits, k=10))
        card_id = f"{prefix}{suffix}"
        if not Family.query.filter_by(privilege_card_id=card_id).first():
            return card_id
