import React from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Option } = Select;

interface LanguageSwitcherProps {
  style?: React.CSSProperties;
  size?: 'small' | 'middle' | 'large';
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  style, 
  size = 'middle' 
}) => {
  const { i18n, t } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  const languages = [
    {
      code: 'zh-CN',
      name: '中文',
      flag: '🇨🇳'
    },
    {
      code: 'en-US',
      name: 'English',
      flag: '🇺🇸'
    }
  ];

  return (
    <Select
      value={i18n.language}
      onChange={handleLanguageChange}
      style={{ 
        minWidth: 120, ...style 
      }}
      size={size}
      suffixIcon={<GlobalOutlined />}
      placeholder={t('language.switch')}
      variant="borderless"
    >
      {languages.map((lang) => (
        <Option key={lang.code} value={lang.code}>
          <span style={{ marginRight: 8 }}>{lang.flag}</span>
          {lang.name}
        </Option>
      ))}
    </Select>
  );
};

export default LanguageSwitcher;