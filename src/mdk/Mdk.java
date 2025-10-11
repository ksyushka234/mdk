
package mdk;

public class Mdk {
    public static void main(String[] args) {
        int[] numbers = {1, 2, 3, 4, 5};
        System.out.println("Сумма: " + sumArray(numbers));
        System.out.println("Максимум: " + findMax(numbers));

        Person person = new Person("Анна");
        person.getBankAccount().deposit(1000);
        person.getBankAccount().withdraw(200);
        System.out.println(person.getName() + " имеет баланс: " +
                person.getBankAccount().getBalance());
    }

    public static int sumArray(int[] array) {
        int sum = 0;
        for (int num : array) {
            sum += num;
        }
        return sum;
    }

    public static int findMax(int[] array) {
        if (array.length == 0) {
            throw new IllegalArgumentException("Массив пустой!");
        }
        int max = array[0];
        for (int i = 1; i < array.length; i++) {
            if (array[i] > max) max = array[i];
        }
        return max;
    }
}

class Person {
    private String name;
    private BankAccount bankAccount;

    public Person(String name) {
        this.name = name;
        this.bankAccount = new BankAccount();
    }

    public String getName() {
        return name;
    }

    public BankAccount getBankAccount() {
        return bankAccount;
    }
}

class BankAccount {
    private double balance;

    public void deposit(double amount) {
        if (amount > 0) balance += amount;
        else System.out.println("Сумма должна быть положительной!");
    }

    public void withdraw(double amount) {
        if (amount > 0 && amount <= balance) {
            balance -= amount;
        } else {
            System.out.println("Недостаточно средств или некорректная сумма!");
        }
    }

    public double getBalance() {
        return balance;
    }
}
    
