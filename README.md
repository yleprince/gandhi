# Gandhi

Helper to take the order to the [Gandhi restaurant](http://www.gandhi-restaurant.fr/index.php/le-midi) at Echirolles

## How to run

Fetch the code

Install [Poetry](poetry.org) somewhere
```sh
# Setup poetry
curl -sSL https://install.python-poetry.org | python3 -
```

Clone the code wherever you like:
```sh
git clone git@github.com:yleprince/gandhi.git
```

Install dependencies:
```sh
$PATH_TO_POETRY/poetry install
```

Execute, normally or in debug:

```sh
# Normal execution
poetry run flask run -p 5000

# Debug execution (with code auto-reload on change)
$PATH_TO_POETRY/poetry run flask run -p 5000 --debug
```




