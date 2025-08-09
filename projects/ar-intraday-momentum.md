# AR(p) Intraday Momentum

An AR model to formalize and test short-term autocorrelation in intraday returns.

## Workflow
1. Stationarize (returns)
2. Pick p by AIC/PACF
3. OLS fit, Ljung–Box diagnostics
4. Convert forecast to trade rules
