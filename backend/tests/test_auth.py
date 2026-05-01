from tests.conftest import client


def test_login_endpoint():
    response = client.post("/api/v1/auth/login")
    assert response.status_code == 200
    assert response.json()["access_token"]


def test_register_and_me_endpoint():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "new.user@ethiocode.com",
            "password": "password123",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201

    token = response.json()["access_token"]
    me_response = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "new.user@ethiocode.com"
