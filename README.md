# Translation Resource Utils
Utilities for working with Unfolding Word translation resources

## Credentials
The `translate_tn9.py` script requires a deepL API key, provided via a JSON file:
```
{
    "deepLAuthKey": "my-deepl-key"
}
```
See https://www.deepl.com/docs-api

## Usage

```
cd scripts
python3.8 translate_tn9.py FR ../creds.json input/en_tn-3JN.tsv output/fr_tn-3JN.tsv
```
