import { Request, Response } from "express";
import { ResponseType, UserSchemaType } from "../model/model_types";
import User from "../model/user";
import bcrypt from "bcrypt";
import jwt, { Secret, JwtPayload } from "jsonwebtoken";

export type BodyType = {
  name?: string;
  password: string | Buffer;
  email: string;
};

export const jwt_secret_key: Secret = <Secret>process.env.JWT_SECRET_KEY;
console.log("CONNECTED : ", jwt_secret_key);

export const register = async (req: Request, res: Response) => {
  const body: BodyType = req.body;
  if (!body.email || !body.name || !body.password) {
    return res.status(400).json(<ResponseType>{
      message: `Something went wrong 🔥.`,
      success: false,
      status: "Internal Server Error",
    });
  }

  const user_exists = await User.findOne({ email: body.email });

  if (user_exists) {
    return res.status(500).json(<ResponseType>{
      message: "user already available",
      success: false,
    });
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(body.password, salt);
  // we can also use as const: Promise<UserSchemaType> = User.create({name, email, password})
  const user: UserSchemaType = await User.create({
    name: body.name,
    email: body.email,
    password: hashedPassword,
  });

  if (user) {
    let response = {
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user),
    };
    return res.status(201).json(response);
  } else {
    return res.status(500).send(<ResponseType>{
      message: "Something went wrong.",
      success: false,
    });
  }
};

export const login = async (req: Request, res: Response): Promise<Response> => {
  const body: BodyType = req.body;
  if (!body.email || !body.password) {
    return res.status(400).json(<ResponseType>{
      message: "Required field is missed.",
      success: false,
    });
  }
  try {
    // request user data
    const foundUser = await User.findOne<UserSchemaType>({ email: body.email });

    if (foundUser && foundUser?.password) {
      const isMatched = bcrypt.compare(body.password, foundUser?.password);
      if (!isMatched) {
        return res.status(401).json(<ResponseType>{
          message: "Invalid cred's",
          success: false,
        });
      }

      return res.status(200).json(<UserSchemaType>{
        _id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        token: generateToken(foundUser),
      });
    } else {
      return res.status(500).json(<ResponseType>{
        message: "Something went wrong",
        success: false,
      });
    }
  } catch (error) {
    return res.status(500).json(<ResponseType>{
      message: "Something went wrong",
      success: false,
    });
  }
};

const generateToken = (payload: UserSchemaType): string | JwtPayload => {
  let token: string | JsonWebKey;
  token = jwt.sign(
    <UserSchemaType>{
      id: payload.id,
      name: payload.name,
      email: payload.email,
    },
    jwt_secret_key,
    {
      expiresIn: "30m",
    }
  );
  return token;
};
