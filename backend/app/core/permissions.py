def require_role(role: str):
    def dependency():
        return role

    return dependency
