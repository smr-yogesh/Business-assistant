from datetime import datetime, timedelta
from model.subscription import Subscription, SubStatus

ALLOWED = {SubStatus.ACTIVE, SubStatus.TRIALING, SubStatus.PAST_DUE}


def business_has_active_subscription(business_id: int, grace_days: int = 3) -> bool:
    s = (
        Subscription.query.filter(Subscription.business_id == business_id)
        .order_by(Subscription.current_period_end.desc().nullslast())
        .first()
    )
    if not s:
        return False

    if s.status not in ALLOWED:
        return False

    # If Stripe hasn’t provided dates yet, allow temporarily.
    if not s.current_period_end:
        return True

    return datetime.utcnow() <= (s.current_period_end + timedelta(days=grace_days))
