from pathlib import Path
from dotenv import load_dotenv
import os

env_path = Path(__file__).parent.parent / '.env'
load_dotenv(dotenv_path=env_path)


postgres_db_url = str(os.getenv('POSTGRES_DB_URL'))

mysql_url = str(os.getenv('MYSQL_DB_URL'))
charset = str(os.getenv('CHARSER'))
mysql_db_url = mysql_url + "?charset=" + charset

debug_mode = int(os.getenv("DEBUG_MODE", 0))

secret_key = os.getenv('SECRET_KEY')
algorithm = os.getenv('ALGORITHM')
example_jwt = os.getenv('EXAMPLE_JWT')
expire_access_days = os.getenv('EXPIRE_ACCESS_DAYS')
expire_refresh_days = os.getenv('EXPIRE_REFRESH_DAYS')
base_id = os.getenv('BASE_ID')
firm_id = os.getenv('FIRM_ID')
discount_id = os.getenv('DISCOUNT_ID')
campaign_id = os.getenv('CAMPAIGN_ID')
public_key = os.getenv('PUBLIC_KEY')