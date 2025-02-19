function Summary({ data }: { data: StoredHero }) {
  return (
    <table>
      <tbody>
        <tr>
          <td>
            <img class="game-asset" src="/weapon-icon.png" />
          </td>
          <td>{data?.weapon}</td>
        </tr>
        <tr>
          <td>
            <img class="game-asset" src="/assist-icon.png" />
          </td>
          <td>{data?.assist}</td>
        </tr>
        <tr>
          <td>
            <img class="game-asset" src="/special-icon.png" />
          </td>
          <td>{data?.special}</td>
        </tr>
        <tr>
          <td>
            <img
              loading="lazy"
              class="game-asset"
              src={
                data?.passive_a !== ""
                  ? `http://localhost:3479/img/${data?.passive_a.replace(
                      "/",
                      ";"
                    )}`
                  : "/A.png"
              }
            />
          </td>
          <td>{data?.passive_a}</td>
        </tr>
        <tr>
          <td>
            <img
              loading="lazy"
              class="game-asset"
              src={
                data?.passive_b !== ""
                  ? `http://localhost:3479/img/${data?.passive_b.replace(
                      "/",
                      ";"
                    )}`
                  : "/B.png"
              }
            />
          </td>
          <td>{data?.passive_b}</td>
        </tr>
        <tr>
          <td>
            <img
              loading="lazy"
              class="game-asset"
              src={
                data?.passive_c !== ""
                  ? `http://localhost:3479/img/${data?.passive_c.replace(
                      "/",
                      ";"
                    )}`
                  : "/C.png"
              }
            />
          </td>
          <td>{data?.passive_c}</td>
        </tr>
        <tr>
          <td>
            <img
              loading="lazy"
              class="game-asset"
              src={
                data?.passive_s !== ""
                  ? `http://localhost:3479/img/${data?.passive_s.replace(
                      "/",
                      ";"
                    )}`
                  : "/C.png"
              }
            />
          </td>
          <td>{data?.passive_s}</td>
        </tr>
      </tbody>
    </table>
  );
}

export default Summary;
