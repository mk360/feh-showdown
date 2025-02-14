function StatsToggle() {
  return (
    <tr>
      <td>Atk</td>
      <td>{!!temporaryChoice && stats.atk}</td>
      <td>
        <input
          class="stat-input"
          id={`${index}-flaw-atk`}
          type="radio"
          {...registerMoveset("atk-change")}
          disabled={[
            getValues("hp-change"),
            getValues("spd-change"),
            getValues("def-change"),
            getValues("res-change"),
          ].includes("flaw")}
          value="flaw"
        />
        <label class="flaw" for={`${index}-flaw-atk`}>
          Flaw
        </label>
      </td>
      <td>
        <input
          class="stat-input"
          id={`${index}-neutral-atk`}
          type="radio"
          {...registerMoveset("atk-change")}
          value="neutral"
        />
        <label class="neutral" for={`${index}-neutral-atk`}>
          Neutral
        </label>
      </td>
      <td>
        <input
          class="stat-input"
          id={`${index}-asset-atk`}
          type="radio"
          {...registerMoveset("atk-change")}
          value="asset"
          disabled={[
            getValues("hp-change"),
            getValues("spd-change"),
            getValues("def-change"),
            getValues("res-change"),
          ].includes("asset")}
        />
        <label class="asset" for={`${index}-asset-atk`}>
          Asset
        </label>
      </td>
    </tr>
  );
}

export default StatsToggle;
