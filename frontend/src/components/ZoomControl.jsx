function ZoomControl() {
  return (
    <div className="zoom-control">
      <label htmlFor="zoom-slider">
        <span></span>
      </label>
      <input 
        type="range" 
        id="zoom-slider" 
        min="80" 
        max="150" 
        defaultValue="100" 
        step="5"
      />
      <span className="zoom-value" id="zoom-value">100%</span>
    </div>
  );
}

export default ZoomControl;
