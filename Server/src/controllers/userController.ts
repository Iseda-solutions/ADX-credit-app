import type { Request, Response } from "express";

import prisma from "../config/db.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/jwt.js";

export async function registerUser(req: Request, res: Response) {
  try {
    const { email, password, firstName, lastName, dateOfBirth, phone, address } = req.body;

    // basic validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // hash the password
    const hashedPassword = await hashPassword(password);

    // create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        dateOfBirth: new Date(dateOfBirth), // must be a valid ISO date
        phone,
        address,
      },
    });

    return res.status(201).json({ message: "User registered successfully", user });
  } catch (error: any) {
    if (error.code === "P2002") {
      // Prisma unique constraint error
      return res.status(400).json({ error: "Email or phone already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}


export async function loginUser(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ id: user.id, email: user.email });

    return res.json({ message: "Login successful", token });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Something went wrong" });
  }
}

