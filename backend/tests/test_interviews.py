from tests.conftest import client


def test_interviews_endpoint():
    response = client.get("/api/v1/interviews/")
    assert response.status_code == 200
