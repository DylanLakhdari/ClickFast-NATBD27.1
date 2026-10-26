FROM python:3.12.7-alpine

WORKDIR /app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py ./

USER nobody
EXPOSE 5000
CMD ["python", "app.py"]
