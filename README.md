# BunRR

Run React Router with Bun.sh.

> Use this template with:
> 
> ```sh
> bun create github.com/nullndr/bunrr
> ```
>
> Now simply run:
>
> ```sh
> bun index.ts
> ```

This is a try to have something like [remix.run](https://remix.run/) but in bun.sh, since no official adapter is still being developed.

The template has server side rendering, `loaders`/`actions`, client side routing, tailwindcss and HMR via websocket. 

## HMR

In order to have HMR you need to run `bun --watch index.ts`.

> HMR does not work with the `--hot` option!