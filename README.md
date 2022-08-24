# @krishna-kapoor/next-apollo v1.0.5

Seamlessly integrate Apollo SSR into NextJS.

## What's new and What's changed in v1.0.5

-   **NEW:** Added support for `getStaticProps`
-   **CHANGED:** Removed the `NextApolloClient` class and replaced it with `createService` that returns utility functions to share the same purpose

## Usage

### 1. Create an `apollo.ts` (or `apollo.js`) file in your `lib` folder

```ts
// lib/apollo.ts

import { createService } from "@krishna-kapoor/next-apollo";
import { HttpLink } from "@apollo/client";

export const { useNextApollo, apolloFetch } = createService({
    link: new HttpLink({
        uri: "<YOUR-URI>",
        credentials: "include",
    }),
});
```

### 2. Open your `_app.tsx` (or `_app.js`) file and add this code

```js
// pages/_app.js

import { useNextApollo } from "lib/apollo";
import { ApolloProvider } from "@apollo/client";

export default function App({ Component, pageProps }) {
    const client = useNextApollo(pageProps);

    return (
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}
```

or using _TypeScript_, like this:

```tsx
// pages/_app.tsx

import { AppProps } from "next";
import { useNextApollo } from "lib/apollo";
import { ApolloProvider } from "@apollo/client";

export default function App({ Component, pageProps }: AppProps) {
    const client = useNextApollo(pageProps);

    return (
        <ApolloProvider client={client}>
            <Component {...pageProps} />
        </ApolloProvider>
    );
}
```

### 3. Use SSR!

```tsx
// pages/index.tsx

import { MY_QUERY } from "path/to/queries/../..";
import { gssp } from "@krishna-kapoor/next-apollo/ssr";
import { apolloFetch } from "lib/apollo";

export default function Page() {
    const { data } = useQuery(MY_QUERY);

    return <div>{JSON.stringify(data, null, 2)}</div>;
}

export const getServerSideProps = gssp(apolloFetch({ query: MY_QUERY }));
```

If you have a query with variables that you want to obtain from the `context.query` object, this is what `getServerSideProps` will look like:

```ts
export const getServerSideProps = gssp(
    apolloFetch({
        query: MY_QUERY,
        variables: query => ({ var1: query.var1 }),
    })
);
```

## Create your own middleware

Usage of the `createGSSPMiddleware` function allows you to create a middleware, which will decide whether the next piece of server-side code should run. This is determined by under what conditions the `next()` function is called. The following example shows how `jwt` tokens are used to provide/prohibit access to a potential user.

```tsx
// custom-middleware.ts

import { middleware } from "@krishna-kapoor/next-apollo/ssr";

export const auth = middleware.serverSide((context, pageProps, next) => {
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
