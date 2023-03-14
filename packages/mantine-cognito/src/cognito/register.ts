import { ISignUpResult, CognitoUserAttribute } from "amazon-cognito-identity-js"
import { CognitoConfig, getPool } from "./utility"

export const signUp = async (config: CognitoConfig, email: string, password: string) => {
    return await new Promise<ISignUpResult | undefined>((resolve, reject) => {
        const userPool = getPool(config)

        const dataEmail = { Name: "email", Value: email }
        const attributeEmail = new CognitoUserAttribute(dataEmail)

        const attributeList: CognitoUserAttribute[] = []
        attributeList.push(attributeEmail)

        userPool.signUp(email, password, attributeList, [], function (err, result) {
            if (err != null) return reject(err)
            resolve(result)
        })
    })
}
