# Geometric Brownian Motion (GBM) Simulator

This page demonstrates a simple Monte Carlo GBM engine and how I use the simulated distribution for tactical risk management.

![paths](https://dummyimage.com/1200x400/ffffff/000000&text=Insert+your+chart+here)

## Method
- Calibrate μ and σ from log-returns
- Simulate 10,000 paths for the next day
- Summarize distribution with mean and σ-bands

## Notes
- Strategy is a probabilistic bet on the mass of the forecast distribution.
- No claim of path-level mean reversion.
