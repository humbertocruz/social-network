import messages from '@/locales/dic'
import { LanguageAtom } from '@/states/atoms';
import { useAtomValue } from 'jotai';
const useDic = () => {
    const lang:string = useAtomValue(LanguageAtom)
    const dic = (key:string) => {
        const keys = key.split('.')
        //@ts-expect-error language is object
        const ret = messages[lang]
        if (!ret) return key
        const sec = ret[keys[0]]
        if (!sec) return key
        const text = sec[keys[1]]
        if (!text) return key
        return text
    }
    return dic
}
export default useDic