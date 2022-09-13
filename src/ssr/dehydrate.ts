import { ApolloClient } from "@apollo/client";
import { ServerSidePageProps, StaticPageProps } from "../createService";

/**
 * This function dehydrates cache data which has to be used to define `pageProps.props.initialApolloState`.
 * @param client the `ApolloClient` instance
 */
export function dehydrate(client: ApolloClient<any>): any;

/**
 * This function dehydrates cache data which has to be used to define `pageProps.props.initialApolloState`. Feeling lazy? Pass in `pageProps` to reduce lines of code.
 * @param client the `ApolloClient` instance
 * @param pageProps the `pageProps` object from the `gssp` middleware function
 */
export function dehydrate(
    client: ApolloClient<any>,
    pageProps: ServerSidePageProps
): any;

/**
 * This function dehydrates cache data which has to be used to define `pageProps.props.initialApolloState`. Feeling lazy? Pass in `pageProps` to reduce lines of code.
 * @param client the `ApolloClient` instance
 * @param pageProps the `pageProps` object from the `gsp` middleware function
 */
export function dehydrate(
    client: ApolloClient<any>,
    pageProps: StaticPageProps
): any;

export function dehydrate(
    client: ApolloClient<any>,
    pageProps?: ServerSidePageProps | StaticPageProps
) {
    const extractedCache = client.cache.extract();

    if (pageProps) {
        pageProps.props.initialApolloState = extractedCache;
    }

    return extractedCache;
}
