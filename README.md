# @krishna-kapoor/next-apollo v1.0.3

Seamlessly integrate Apollo SSR into NextJS.

## Usage

Set up a modified version of `ApolloClient`, which sets all queried data to the cache on the server-side of NextJS, which allows SSR.

### 1. Create an `apollo` directory in your root folder and add an `index.ts` (or `index.js`) file to it

```ts
// apollo/index.ts

import { NextApolloClient } from "@krishna-kapoor/next-apollo";
import { HttpLink, InMemoryCache } from "@apollo/client";

export const apolloService = new NextApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        uri: "<Your URL>",
        credentials: "include",
        // ...
    }),
});
```

### 2. Open your `_app.tsx` (or `_app.js`) file and add this code

```js
// pages/_app.js

import NextApolloClient from "@krishna-kapoor/next-apollo";
import { ApolloProvider } from "@apollo/client";

export default function App({ Component, pageProps }) {
    const client = apolloService.useNextApollo(pageProps.initialApolloState);

    return (
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}
```

or using _TypeScript_, like this:

```typescriptreact
// pages/_app.tsx

import NextApolloClient from "@krishna-kapoor/next-apollo";
import { AppProps } from "next";
import { ApolloProvider } from "@apollo/client";

export default function App({ Component, pageProps }: AppProps) {
    const client = apolloService.useNextApollo(pageProps.initialApolloState);

    return (
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}
```

### 3. Use SSR!

```typescriptreact
// pages/index.tsx

import { MY_QUERY } from "../../path/to/queries";
import { gssp } from "@krishna-kapoor/next-apollo/utils";

export default function Page() {
    const { data } = useQuery(MY_QUERY);

    return <div>{JSON.stringify(data, null, 2)}</div>;
}

export const getServerSideProps = gssp(apolloService.apolloFetch({ query: MY_QUERY }));
```

If you have a query with variables that you want to obtain from the `context.query` object, this is what `getServerSideProps` will look like:

```ts
export const getServerSideProps = gssp(
    apolloService.apolloFetch({
        query: MY_QUERY,
        variables: query => ({ var1: query.var1 }),
    })
);
```

## Create your own middleware

Usage of the `createGSSPMiddleware` function allows you to create a middleware, which will decide whether the next piece of server-side code should run. This is determined by under what conditions the `next()` function is called. The following example shows how `jwt` tokens are used to provide/prohibit access to a potential user.

```typescriptreact
export const auth = createGSSPMiddleware((context, pageProps, next) => {
    const accessToken = context.req.cookies["<cookie key>"];

    if (accessToken) {
        return next();
    }

    pageProps.redirect = {
        destination: "/login",
        permanent: false,
    };
});
```

**GitHub**: https://github.com/krishna-kapoor/next-apollo
