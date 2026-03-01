import requests
import argparse
import json
import os

BASE_URL = os.getenv("OPENRETRO_API_URL", "http://localhost:9982/api")

def call_api(method, path, data=None):
    url = f"{BASE_URL}/{path}"
    headers = {"Content-Type": "application/json"}
    try:
        response = requests.request(method, url, json=data, headers=headers)
        response.raise_for_status() # Raise an exception for HTTP errors
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print(f"HTTP error occurred: {http_err} - {response.text}")
    except requests.exceptions.ConnectionError as conn_err:
        print(f"Connection error occurred: {conn_err}. Is the API running at {BASE_URL}?")
    except requests.exceptions.Timeout as timeout_err:
        print(f"Timeout error occurred: {timeout_err}")
    except requests.exceptions.RequestException as req_err:
        print(f"An unexpected error occurred: {req_err}")
    return None

def add_card(args):
    payload = {
        "author": args.author,
        "column_type": args.column,
        "text": args.text
    }
    response = call_api("POST", f"sessions/{args.session}/cards", payload)
    if response:
        print(f"Card added: {response['card_id']}")

def merge_cards(args):
    payload = {
        "into_card_id": args.into
    }
    response = call_api("POST", f"cards/{args.card}/merge", payload)
    if response:
        print(f"Cards merged. Merged card: {response['merged_card_id']} into {response['into_card_id']}")

def add_comment(args):
    payload = {
        "author": args.author,
        "text": args.text
    }
    response = call_api("POST", f"cards/{args.card}/comments", payload)
    if response:
        print(f"Comment added: {response['comment_id']}")

def list_cards(args):
    response = call_api("GET", f"sessions/{args.session}")
    if response:
        print(json.dumps(response, indent=2))

def main():
    parser = argparse.ArgumentParser(description="OpenRetro CLI tool for agents.")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # Add Card command
    add_parser = subparsers.add_parser("add", help="Add a new card to a session.")
    add_parser.add_argument("--session", required=True, help="Session ID.")
    add_parser.add_argument("--column", required=True, choices=["good", "better", "actions"], help="Column type (good, better, actions).")
    add_parser.add_argument("--text", required=True, help="Content of the card.")
    add_parser.add_argument("--author", required=True, help="Author of the card.")
    add_parser.set_defaults(func=add_card)

    # Merge Cards command
    merge_parser = subparsers.add_parser("merge", help="Merge one card into another.")
    merge_parser.add_argument("--card", required=True, help="ID of the card to merge.")
    merge_parser.add_argument("--into", required=True, help="ID of the target card.")
    merge_parser.set_defaults(func=merge_cards)

    # Add Comment command
    comment_parser = subparsers.add_parser("comment", help="Add a comment to a card.")
    comment_parser.add_argument("--card", required=True, help="ID of the card to comment on.")
    comment_parser.add_argument("--text", required=True, help="Content of the comment.")
    comment_parser.add_argument("--author", required=True, help="Author of the comment.")
    comment_parser.set_defaults(func=add_comment)

    # List Cards command
    list_parser = subparsers.add_parser("list", help="List all cards in a session.")
    list_parser.add_argument("--session", required=True, help="Session ID.")
    list_parser.set_defaults(func=list_cards)

    args = parser.parse_args()
    args.func(args)

if __name__ == "__main__":
    main()