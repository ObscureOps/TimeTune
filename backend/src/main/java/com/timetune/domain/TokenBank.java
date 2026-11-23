package com.timetune.domain;

/** Encapsulates token economy invariants. */
public final class TokenBank {
    public static final int DEFAULT_STARTING_TOKENS = 1;
    public static final int MAX_TOKENS = 5;
    private int balance;
    public TokenBank() { this(DEFAULT_STARTING_TOKENS); }
    public TokenBank(int startingBalance) {
        if (startingBalance < 0 || startingBalance > MAX_TOKENS) throw new IllegalArgumentException("Invalid starting balance");
        balance = startingBalance;
    }
    public int getBalance() { return balance; }
    public boolean canSpend(int amount) { return amount > 0 && balance >= amount; }
    public void spend(int amount) {
        if (!canSpend(amount)) throw new IllegalStateException("Insufficient tokens");
        balance -= amount;
    }
    public void earn(int amount) {
        if (amount < 0) throw new IllegalArgumentException("Cannot earn a negative amount");
        balance = Math.min(MAX_TOKENS, balance + amount);
    }
}
