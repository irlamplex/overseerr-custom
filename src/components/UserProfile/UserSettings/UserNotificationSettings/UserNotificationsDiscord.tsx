import axios from 'axios';
import { Field, Form, Formik } from 'formik';
import { useRouter } from 'next/router';
import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useToasts } from 'react-toast-notifications';
import useSWR from 'swr';
import * as Yup from 'yup';
import { UserSettingsNotificationsResponse } from '../../../../../server/interfaces/api/userSettingsInterfaces';
import { useUser } from '../../../../hooks/useUser';
import globalMessages from '../../../../i18n/globalMessages';
import Button from '../../../Common/Button';
import LoadingSpinner from '../../../Common/LoadingSpinner';

const messages = defineMessages({
  discordsettingssaved: 'Discord notification settings saved successfully!',
  discordsettingsfailed: 'Discord notification settings failed to save.',
  enableDiscord: 'Enable Mentions',
  discordId: 'User ID',
  discordIdTip:
    'The <FindDiscordIdLink>ID number</FindDiscordIdLink> for your user account',
  validationDiscordId: 'You must provide a valid user ID',
});

const UserNotificationsDiscord: React.FC = () => {
  const intl = useIntl();
  const { addToast } = useToasts();
  const router = useRouter();
  const { user } = useUser({ id: Number(router.query.discordId) });
  const { data, error, revalidate } = useSWR<UserSettingsNotificationsResponse>(
    user ? `/api/v1/user/${user?.id}/settings/notifications` : null
  );

  const UserNotificationsDiscordSchema = Yup.object().shape({
    discordId: Yup.string()
      .nullable()
      .matches(/^\d{17,18}$/, intl.formatMessage(messages.validationDiscordId)),
  });

  if (!data && !error) {
    return <LoadingSpinner />;
  }

  return (
    <Formik
      initialValues={{
        enableDiscord: data?.enableDiscord,
        discordId: data?.discordId,
      }}
      validationSchema={UserNotificationsDiscordSchema}
      onSubmit={async (values) => {
        try {
          await axios.post(`/api/v1/user/${user?.id}/settings/notifications`, {
            enableDiscord: values.enableDiscord,
            discordId: values.discordId,
          });
          addToast(intl.formatMessage(messages.discordsettingssaved), {
            appearance: 'success',
            autoDismiss: true,
          });
        } catch (e) {
          addToast(intl.formatMessage(messages.discordsettingsfailed), {
            appearance: 'error',
            autoDismiss: true,
          });
        } finally {
          revalidate();
        }
      }}
    >
      {({ errors, touched, isSubmitting }) => {
        return (
          <Form className="section">
            <div className="form-row">
              <label htmlFor="enableDiscord" className="checkbox-label">
                {intl.formatMessage(messages.enableDiscord)}
              </label>
              <div className="form-input">
                <Field
                  type="checkbox"
                  id="enableDiscord"
                  name="enableDiscord"
                />
              </div>
            </div>
            <div className="form-row">
              <label htmlFor="discordId" className="text-label">
                <span>{intl.formatMessage(messages.discordId)}</span>
                <span className="label-tip">
                  {intl.formatMessage(messages.discordIdTip, {
                    FindDiscordIdLink: function FindDiscordIdLink(msg) {
                      return (
                        <a
                          href="https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID-"
                          target="_blank"
                          rel="noreferrer"
                          className="text-gray-100 underline transition duration-300 hover:text-white"
                        >
                          {msg}
                        </a>
                      );
                    },
                  })}
                </span>
              </label>
              <div className="form-input">
                <div className="form-input-field">
                  <Field id="discordId" name="discordId" type="text" />
                </div>
                {errors.discordId && touched.discordId && (
                  <div className="error">{errors.discordId}</div>
                )}
              </div>
            </div>
            <div className="actions">
              <div className="flex justify-end">
                <span className="inline-flex ml-3 rounded-md shadow-sm">
                  <Button
                    buttonType="primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? intl.formatMessage(globalMessages.saving)
                      : intl.formatMessage(globalMessages.save)}
                  </Button>
                </span>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default UserNotificationsDiscord;
