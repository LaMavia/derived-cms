open Helpers;

type link = {
  text: string,
  href: string,
};

type section = {
  title: string,
  links: array(link),
};

[@react.component]
let make = () => {
  let sections: array(section) = [|
    {
      title: "icons",
      links: [|
        {text: "download source", href: "https://www.flaticon.com/"},
        {text: "author: freepik", href: "https://www.freepik.com/"},
        {
          text: "author: smashicons",
          href: "https://www.flaticon.com/authors/smashicons",
        },
        {
          text: "license",
          href: "http://creativecommons.org/licenses/by/3.0/",
        },
      |],
    },
    {
      title: "where to find me",
      links: [|
        {text: "github", href: "https://github.com/DerivedMate"},
        {
          text: "e-mail",
          href: "mailto: kemikspl@gmail.com?subject=feedback%20derivedcms",
        },
      |],
    },
  |];

  <footer className="footer">
    {sections
     ->Belt.Array.mapWithIndex((i, sec) =>
         <section className="footer__col" key={i->string_of_int}>
           <h4 className="footer__col__title"> sec.title->str </h4>
           {sec.links
            ->Belt.Array.mapWithIndex((j, link) =>
                <a
                  target="_blank"
                  key={j->string_of_int}
                  href={link.href}
                  className="footer__col__link">
                  link.text->str
                </a>
              )
            ->React.array}
         </section>
       )
     ->React.array}
  </footer>;
};