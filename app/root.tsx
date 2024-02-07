import {
  Form,
  Links,
  LiveReload,
  NavLink,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "@remix-run/react";
import { json, redirect } from "@remix-run/node";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useEffect, useState } from "react";
import appStyleHref from "./app.css";

import { createEmptyContact, getContacts } from "./data";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: appStyleHref },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const contacts = await getContacts(q);
  // await new Promise((resolve) => setTimeout(() => resolve(''), 200));
  return json({ contacts, q });
};

export const action = async () => {
  const contact = await createEmptyContact();
  return redirect(`contacts/${contact.id}/edit`);
  // return json({ contact });
};

export default function App() {
  const { contacts, q } = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  // const [ query, setQuery ] = useState(q || "")
  const searching = navigation.location && new URLSearchParams(navigation.location.search).has("q");
  console.log(navigation.location);

  useEffect(() => {
    const searchField = document.getElementById('q');
    if(searchField instanceof HTMLInputElement) {
      searchField.value = q || "";
    }
    // console.log(q)
  }, [q]);

  // **Controlled version
  // useEffect(() => {
  //   setQuery(q || "")
  // }, [q]);

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <div id="sidebar">
          <h1>Remix Contacts</h1>
          <div>
            <Form 
            id="search-form" 
            onChange={
              (e) => submit(e.currentTarget)
            }
            role="search">
              <input
                id="q"
                defaultValue={ q || "" }
                className={ searching ? "loading" : "" }
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
              />
              <div id="search-spinner" aria-hidden hidden={!searching}  />
            </Form>
            {/* **Controlled version */}
            {/* <Form id="search-form" role="search">
              <input
                id="q"
                value={ query }
                aria-label="Search contacts"
                placeholder="Search"
                type="search"
                name="q"
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
              <div id="search-spinner" aria-hidden hidden={true} />
            </Form> */}
            <Form method="post">
              <button type="submit">New</button>
            </Form>
          </div>
          <nav>
            {contacts.length ? (
              <ul>
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <NavLink
                      className={({ isActive, isPending }) =>
                        isActive ? "active" : isPending ? "pending" : ""
                      }
                      to={`contacts/${contact.id}`}
                    >
                      {contact.first || contact.last ? (
                        <>
                          {contact.first} {contact.last}
                        </>
                      ) : (
                        <i>No Name</i>
                      )}{" "}
                      {contact.favorite ? <span>★</span> : null}
                    </NavLink>
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                <i>No contacts</i>
              </p>
            )}
          </nav>
        </div>
        <div
          className={navigation.state === "loading" && !searching ? "loading" : ""}
          id="detail"
        >
          <Outlet />
        </div>
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  );
}
