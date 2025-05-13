function Summary({ data }: { data: StoredHero }) {
  return (
    <div class="summary-grid">
      <div>
        <img class="game-asset" src="/teambuilder/weapon-icon.png" />
      </div>
      <div>{data?.weapon}</div>
      <div>
        <img class="game-asset" src="/teambuilder/assist-icon.png" />
      </div>
      <div>{data?.assist}</div>
      <div>
        <img class="game-asset" src="/teambuilder/special-icon.png" />
      </div>
      <div>{data?.special}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.passive_a !== ""
              ? `http://localhost:3479/img/${data?.passive_a.replace("/", ";")}`
              : "/teambuilder/A.png"
          }
        />
      </div>
      <div>{data?.passive_a}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.passive_b !== ""
              ? `http://localhost:3479/img/${data?.passive_b.replace("/", ";")}`
              : "/teambuilder/B.png"
          }
        />
      </div>
      <div>{data?.passive_b}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.passive_c !== ""
              ? `http://localhost:3479/img/${data?.passive_c.replace("/", ";")}`
              : "/teambuilder/C.png"
          }
        />
      </div>
      <div>{data?.passive_c}</div>
      <div>
        <img
          loading="lazy"
          class="game-asset"
          src={
            data?.passive_s !== ""
              ? `http://localhost:3479/img/${data?.passive_s.replace("/", ";")}`
              : "/teambuilder/S.png"
          }
        />
      </div>
      <div>{data?.passive_s}</div>
    </div>
  );
}

export default Summary;
