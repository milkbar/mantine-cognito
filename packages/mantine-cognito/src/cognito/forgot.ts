import { CognitoConfig, getUser } from "./utility"

export const forgotPassword = async (config: CognitoConfig, email: string) => {
    return await new Promise<undefined>((resolve, reject) => {
        const cognitoUser = getUser(config, email)

        cognitoUser.forgotPassword({
            onSuccess: () => {
                resolve(undefined)
            },
            onFailure: (err) => {
                reject(err)
            },
        })
    })
}

export const confirmPassword = async (config: CognitoConfig, email: string, code: string, password: string) => {
    return await new Promise<string>((resolve, reject) => {
        const cognitoUser = getUser(config, email)
        cognitoUser.confirmPassword(code, password, {
            onSuccess: (success) => {
                resolve(success)
            },
            onFailure: (err) => {
                reject(err)
            },
        })
    })
}
