FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install aiodns	
ENV AIOHTTP_NO_EXTENSIONS=1
COPY . .
EXPOSE 8013
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8013"]
