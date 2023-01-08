<script type="text/javascript">
  import { getStores, navigating, page, updated } from '$app/stores';
  export let data

  let detailSession = null
  let sessionViews = []
  let detailView = null

  $: {
    let id = $page.url.searchParams.get('session')
    detailSession = data.sessions.find(node => node.id === id)
    if (detailSession) {
      if (detailSession.viewed) {
        Array.isArray(detailSession.viewed) ? detailSession.viewed = detailSession.viewed : detailSession.viewed = [detailSession.viewed]

        sessionViews = detailSession.viewed.map(view => {
          return data.views.find(node => node.id === view.id)
        }).sort((a, b) => {
          return a.dt > b.dt
        })
      }
    }

  }

  $: {
    let id = $page.url.searchParams.get('view')
    detailView = data.views.find(node => node.id === id)
  }
</script>

<h1>pushbroom.co</h1>

<main class="grid">
  <section>
    <h2>Summary</h2>

    <h3>Page Views: <mark>{data.summary.views}</mark></h3>
    <h3>Sessions: <mark>{data.summary.sessions}</mark></h3>

    <h2>Top Pages</h2>
    <ol>
      {#each data.pages as page}
        <li>
          <details>
            <summary>{page[0]} : {page[1].count}</summary>
            <ul>
              {#each page[1].sessions as view}
                <li><a href="/?view={view}">{view}</a></li>
              {/each}
            </ul>
          </details>
        </li>
      {/each}
    </ol>

    <h2>Referrals</h2>
    <ol>
      {#each data.referrers as referrer}
        <li>
          <details>
            <summary>
              {referrer[0].length > 0 ? referrer[0] : 'None'} : {referrer[1].count}
            </summary>
            <ul>
              {#each referrer[1].sessions as session}
                <li><a href="/?session={session}">{session}</a></li>
              {/each}
            </ul>
          </details>
        </li>
      {/each}
    </ol>
  </section>
  {#if detailSession}
    <section>
      <a href="/">Close</a>
      <h2>Session: {detailSession.id}</h2>
      <dl>
        <dt>Referrer</dt>
        <dd>{detailSession.r.length > 0 ? detailSession.r : 'None'}</dd>

        <dt>Start Time</dt>
        <dd>{new Date(parseInt(detailSession.dt))}</dd>

        <dt>Browser</dt>
        <dd>{detailSession.browser}</dd>

        <dt>Browser Version</dt>
        <dd>{detailSession.browserVersion}</dd>

        <dt>Operating System</dt>
        <dd>{detailSession.os}</dd>
      </dl>

      <h3>Views</h3>
      <table>
        <thead>
          <th>URL</th>
          <th>Timestamp</th>
        </thead>
        <tbody>
          {#each sessionViews as view}
            <tr>
              <td>
                <a href="/?view={view.id}">{view.p}</a>
              </td>
              <td>
                {view.dt}
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}
  {#if detailView}
    <section>
      <a href="/">Close</a>
      <h2>View: {detailView.id}</h2>
      <dl>
        <dt>URL:</dt>
        <dd>{detailView.p}</dd>

        <dt>From:</dt>
        <dd>{detailView.from}</dd>

        <dt>Time</dt>
        <dd>{detailView.dt}</dd>

        <dt>Screen Width</dt>
        <dd>{detailView.w}</dd>

        {#if detailView.inSession}
          <dt>Session:</dt>
          <dd><a href="/?session={detailView.inSession}">{detailView.inSession}</a></dd>
        {/if}
      </dl>
    </section>
  {/if}
</main>

<style type="text/css">

  .grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
</style>