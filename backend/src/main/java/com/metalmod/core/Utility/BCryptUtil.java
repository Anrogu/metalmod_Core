package com.metalmod.core.Utility;

import org.springframework.security.crypto.bcrypt.BCrypt;

public class BCryptUtil {

    public static void main(String[] args) {
        String Passwrd = "mySecurePassword123";

        // 1. Hash the password (gensalt automatically manages a secure 128-bit salt)
        String hashedPassword = BCrypt.hashpw(Passwrd, BCrypt.gensalt(12)); //
        System.out.println("Hashed Password: " + hashedPassword);
        }
    }
