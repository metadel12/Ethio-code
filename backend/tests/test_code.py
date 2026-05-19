from tests.conftest import client


def test_code_run_endpoint():
    response = client.post("/api/v1/code/run", json={"language": "python", "source": "print('hi')"})
    assert response.status_code == 200
