# url-shortener-microservice
FreeCodeCamp API Challenge #3

This web application accepts a website URL(e.g. `https://github.com`) and assigns it a redirect ID.

#### Example

Submitting `/https://github.com` will return a JSON object like this:

```json
{
  "original_url": "https://github.com",
  "short_url": "/4"
}
```

Now, submitting `/4` will redirect the page to "https://github.com".

By default, the application stores a maximum of 50 URLs at a time, and begins removing old URLs when the limit is reached.
