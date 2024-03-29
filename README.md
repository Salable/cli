# @salable/cli

The Salable CLI enables you to interact with your Salable account and allows you to perform actions as if you were using the dashboard.

## Installation

You can install the latest Salable CLI globally using `npm i -g @salable/cli`.

## Getting Started

Once you have the CLI installed globally, it needs to be connected to your Salable account. You can do this with the steps below.

- Run `salable auth` in a terminal window to start the authentication process.
- A browser tab will open asking for your organization, enter the organization you wish to authenticate with.
- You will then be asked for your username and password, enter these, and press "continue" to continue the auth process.

If everything worked correctly, you will be shown a success page and you are now authenticated and can now close the browser tab.

If something went wrong, you'll be shown a failed page. You should close this tab and re-run the `salable auth` command to try and authenticate again.

## Commands Overview

If at any point you want to get a list of the commands you can run based on your current command level, you can use the `help` command.

For example, `salable help` will return all top level commands and `salable create help` will list all of the commands you can run under the `create` command.

You can also see all the options that can be passed to a command by appending `help` to the command. For example, `salable deprecate product help` would yield.

```
Deprecate a product from your Salable account

Options:
      --version  Show version number  [boolean]
      --uuid     The UUID of the product you want to deprecate  [string]
  -h, --help     Show help  [boolean]
```

### Current Commands

####  **Misc.**

- `salable auth`: Authenticate with your Salable Account

#### **List**

- `salable list products`: List all the products from your Salable account
- `salable list api-keys`: List all the API keys from your Salable account
- `salable list capabilities`: List all the capabilities on a product in your Salable account
- `salable list features`: List all the features on a product in your Salable account
- `salable list plans`: List all the plans on a product in your Salable account
- `salable list licenses`: List all the licenses in your Salable account

#### **Create**

- `salable create app`: Create an example application using Salable
- `salable create api-key`: Create a new API key for your Salable account
- `salable create product`: Create a new product in your Salable account
- `salable create capability`: Create a new capability on a product in your Salable account
- `salable create feature`: Create a new feature on a product in your Salable account
- `salable create plan`: Create a new plan on a product in your Salable account
- `salable create license`: Create a new license in your Salable account

#### **Update**

- `salable update feature`: Update a feature on a product in your Salable account
- `salable update plan`: Update a plan on a product in your Salable account
- `salable update license`: Update a license in your Salable account

#### **Deprecate**

- `salable deprecate product`: Deprecate a product from your Salable account
- `salable deprecate api-key`: Deprecate an API key from your Salable account
- `salable deprecate capability`: Deprecate a capability on a product in your Salable account
- `salable deprecate plan`: Deprecate a plan on a product in your Salable account

#### **Suspend**

- `salable suspend license`: Suspend a license in your Salable account
