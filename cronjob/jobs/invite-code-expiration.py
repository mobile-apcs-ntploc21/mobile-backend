from config import config
import requests

response = requests.get(f'http://{config.HOST}:{config.PORT}/{config.ROUTE}/clean-invite-code')
print(response.text)
