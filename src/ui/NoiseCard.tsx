import { useAppStore } from "../store/use-app-store";

export function NoiseCard() {
  const noise = useAppStore((state) => state.noise);
  const setNoiseType = useAppStore((state) => state.setNoiseType);
  const setNoiseVolume = useAppStore((state) => state.setNoiseVolume);

  return (
    <section className="card">
      <h2>Концентрация (шум)</h2>
      <div className="row">
        <label>
          Тип
          <select
            data-testid="noise-toggle-switch"
            value={noise.noiseType}
            onChange={(e) => setNoiseType(e.target.value as typeof noise.noiseType)}
          >
            <option value="off">Выкл</option>
            <option value="white">White noise</option>
            <option value="pink">Pink noise</option>
            <option value="brown">Brown noise</option>
          </select>
        </label>

        <label>
          Громкость
          <input
            data-testid="volume-slider"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={noise.volume}
            onChange={(e) => setNoiseVolume(Number(e.target.value))}
          />
        </label>
      </div>
      <p className="muted">По умолчанию шум выключен.</p>
    </section>
  );
}
