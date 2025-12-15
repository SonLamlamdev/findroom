import React from 'react';
import { FiLock, FiEye, FiDatabase, FiShare2, FiTrash2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const Privacy = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Header */}
      <div className="bg-primary-600 dark:bg-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t('privacy.title')}</h1>
          <p className="text-primary-100 text-xl max-w-2xl mx-auto">
            {t('privacy.subtitle')}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-4xl mx-auto p-8 border border-gray-200 dark:border-gray-700">
          
          <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
            <p className="mb-8">
              {t('privacy.intro')}
            </p>

            {/* 1. Data Collection */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiDatabase className="mr-2" />
                {t('privacy.s1.title')}
              </h2>
              <p className="mb-2">{t('privacy.s1.intro')}</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('privacy.s1.l1')}</li>
                <li>{t('privacy.s1.l2')}</li>
              </ul>
            </section>

            {/* 2. Usage */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-green-600 dark:text-green-400">
                <FiEye className="mr-2" />
                {t('privacy.s2.title')}
              </h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('privacy.s2.l1')}</li>
              </ul>
            </section>

            {/* 3. Sharing */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-blue-500">
                <FiShare2 className="mr-2" />
                {t('privacy.s3.title')}
              </h2>
              <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900/30">
                <p className="font-semibold mb-2 text-blue-800 dark:text-blue-300">{t('privacy.s3.subtitle')}</p>
                <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300">
                  <li>{t('privacy.s3.l1')}</li>
                  <li>{t('privacy.s3.l2')}</li>
                  <li>{t('privacy.s3.l3')}</li>
                </ul>
              </div>
            </section>

            {/* 4. Security */}
            <section className="mb-10">
              <h2 className="text-xl font-bold mb-4 flex items-center text-primary-600 dark:text-primary-400">
                <FiLock className="mr-2" />
                {t('privacy.s4.title')}
              </h2>
              <p>
                {t('privacy.s4.content')}
              </p>
            </section>

            {/* 5. User Rights */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center text-red-500">
                <FiTrash2 className="mr-2" />
                {t('privacy.s5.title')}
              </h2>
              <p className="mb-2">{t('privacy.s5.intro')}</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>{t('privacy.s5.l1')}</li>
                <li>{t('privacy.s5.l2')}</li>
              </ul>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;