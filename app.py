import glob

import pandas as pd
from flask import Flask, redirect, render_template, request, url_for

app = Flask(__name__)

menu = pd.read_csv("static/menu.csv")

categories = menu["Category"].unique().tolist()


def process(menu, category):
    return menu[menu["Category"] == category].to_dict(orient="records")


menu = {c: process(menu, c) for c in categories}


def today():
    return pd.Timestamp.now().strftime("%Y-%m-%d")


@app.route("/")
def show_menu():
    return render_template("menu.html", menu_items=menu)


@app.route("/order")
def order():
    owner = request.args.get("owner", "anonymous")
    items_param = request.args.get("items", "")

    if items_param == "":
        return redirect(url_for("full_order"))

    parsed_items = []

    for item in items_param.split(","):
        item_name, item_quantity = item.rsplit("_", 1)

        parsed_items.append(
            {
                "owner": owner,
                "name": item_name,
                "quantity": int(item_quantity),
            }
        )
    owner_str = owner.lower().replace(" ", "_")
    pd.DataFrame(parsed_items).to_csv(
        f"data/command_{today()}_{owner_str}.csv", index=False
    )

    return redirect(url_for("full_order"))


@app.route("/full_order")
def full_order():
    csv_files = glob.glob(f"data/command_*{today()}*.csv")
    if len(csv_files) == 0:
        return render_template(
            "full_order.html", today=today(), all_orders=[], grouped=[]
        )
    all_orders = pd.concat([pd.read_csv(f) for f in csv_files])
    grouped = (
        all_orders[["name", "quantity"]]
        .groupby(["name"])
        .sum()
        .reset_index()
        .sort_values("quantity", ascending=False)
    )
    return render_template(
        "full_order.html",
        today=today(),
        all_orders=all_orders.to_dict(orient="records"),
        grouped=grouped.to_dict(orient="records"),
    )
