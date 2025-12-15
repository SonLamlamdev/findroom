import React from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiUsers, FiShield, FiHeart, FiCheckCircle } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

const About = () => {
  const { t } = useTranslation();

  const coreValues = [
    {
      title: t('about.values.v1_title'),
      desc: t('about.values.v1_desc'),
    },
    {
      title: t('about.values.v2_title'),
      desc: t('about.values.v2_desc'),
    },
    {
      title: t('about.values.v3_title'),
      desc: t('about.values.v3_desc'),
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
      {/* Hero Section */}
      <div className="bg-primary-600 dark:bg-primary-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">{t("about.title.title1")}</h1>
          <p className="text-xl max-w-2xl mx-auto text-primary-100">
            {t("about.title.title2")}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          
          {/* Our Story */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
              <FiHeart className="mr-2 text-red-500" />
              {t('about.story.title')}
            </h2>
            <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
              <p className="mb-4">
                {t('about.story.p1')}
              </p>
              <p>
                {t('about.story.p2_prefix')} <strong>{t('about.story.p2_strong')}</strong> {t('about.story.p2_suffix')}
              </p>
            </div>
          </section>

          {/* Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-lg">
              <FiTarget className="text-4xl text-blue-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{t('about.mission.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.mission.content')}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-lg">
              <FiUsers className="text-4xl text-green-600 mb-4" />
              <h3 className="text-xl font-bold mb-2 text-gray-800 dark:text-white">{t('about.vision.title')}</h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('about.vision.content')}
              </p>
            </div>
          </section>

          {/* Core Values */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
              <FiShield className="mr-2 text-primary-600" />
              {t('about.values.title')}
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {coreValues.map((item, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 p-4 rounded-lg hover:shadow-md transition-shadow">
                  <FiCheckCircle className="text-green-500 mb-2 text-xl" />
                  <h4 className="font-bold text-gray-800 dark:text-white mb-2">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <div className="text-center border-t border-gray-200 dark:border-gray-700 pt-8">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
              {t('about.cta.title')}
            </h3>
            <div className="flex justify-center gap-4">
              <Link to="/" className="btn-primary py-2 px-6 rounded-lg font-semibold bg-primary-600 text-white hover:bg-primary-700">
                {t('about.cta.btn_view')}
              </Link>
              <Link to="/register" className="btn-secondary py-2 px-6 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-white">
                {t('about.cta.btn_register')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;