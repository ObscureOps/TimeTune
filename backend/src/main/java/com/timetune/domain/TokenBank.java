package com.timetune.domain;

public final class TokenBank {
    public static final int MAX_TOKENS = 5;
    private int balance;

    public TokenBank(int startingBalance) {
        if (startingBalance < 0 || startingBalance > MAX_TOKENS) throw new IllegalArgumentException("Token balance out of range");
        balance = startingBalance;
    }

    public int balance() { return balance; }
    public boolean spend(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("Spend amount must be positive");
        if (balance < amount) return false;
        balance -= amount;
        return true;
    }
    public void earn(int amount) {
        if (amount <= 0) throw new IllegalArgumentException("Earn amount must be positive");
        balance = Math.min(MAX_TOKENS, balance + amount);
    }
}
