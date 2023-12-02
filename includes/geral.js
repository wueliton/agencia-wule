import crossEnv from 'cross-env';

const url = process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:5500/dist/' : 'https://wueliton.github.io/agencia-wule/';

export const geral = {
    empresa: 'Wule Agência Digital',
    slogan: 'Especialistas em SEO e Otimização de Sites',
    siteUrl: url,
    logo: `${url}images/logo.png`,
    phone: '(11) 94004-3902'
}